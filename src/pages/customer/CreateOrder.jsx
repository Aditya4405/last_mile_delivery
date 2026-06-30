import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rateCardService } from '../../services/rateCardService';
import { orderService } from '../../services/orderService';
import { ZONES } from '../../constants';
import { calculateVolumetricWeight, calculateBillableWeight, formatCurrency } from '../../utils';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { FiPlusCircle, FiCompass, FiMapPin, FiTruck, FiTrendingUp } from 'react-icons/fi';

const CreateOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculations, setCalculations] = useState({
    volumetricWeight: 0,
    billableWeight: 0,
    estimatedPrice: 0,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pickupAddress: '',
      pickupZone: '',
      dropAddress: '',
      dropZone: '',
      length: '',
      breadth: '',
      height: '',
      actualWeight: '',
      orderType: 'B2C',
      paymentType: 'Prepaid',
    },
  });

  // Watch fields to trigger calculations
  const formValues = useWatch({ control });

  const { length, breadth, height, actualWeight, pickupZone, dropZone, orderType, paymentType } = formValues;

  useEffect(() => {
    const calculateRates = async () => {
      const volWeight = calculateVolumetricWeight(length, breadth, height);
      const actWeight = parseFloat(actualWeight) || 0;
      const billWeight = calculateBillableWeight(actWeight, volWeight);
      
      let price = 0;
      if (pickupZone && dropZone && orderType && paymentType && billWeight > 0) {
        try {
          price = await rateCardService.calculateOrderPrice(
            pickupZone,
            dropZone,
            orderType,
            paymentType,
            billWeight
          );
        } catch (err) {
          console.error(err);
          price = billWeight * 5; // fallback pricing multiplier
        }
      }

      setCalculations({
        volumetricWeight: volWeight,
        billableWeight: billWeight,
        estimatedPrice: price,
      });
    };

    calculateRates();
  }, [length, breadth, height, actualWeight, pickupZone, dropZone, orderType, paymentType]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const finalOrderData = {
        ...data,
        volumetricWeight: calculations.volumetricWeight,
        billableWeight: calculations.billableWeight,
        price: calculations.estimatedPrice,
      };

      await orderService.createOrder(finalOrderData, user);
      toast.success('Manifest order registered successfully!');
      navigate('/customer/orders');
    } catch (err) {
      toast.error(err.message || 'Failed to submit order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const zoneOptions = ZONES.map((z) => ({ value: z.id, label: `${z.name} (${z.code})` }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FiPlusCircle className="text-brand-655" />
          Book Delivery Shipment
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Provide logistics parameters to generate quotes and verify billing scopes.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Fields */}
        <div className="md:col-span-2 space-y-5 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-205 dark:border-slate-750 shadow-card">
          <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-2">
            1. Addresses & Routing Zones
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pickup Zone"
              name="pickupZone"
              options={zoneOptions}
              error={errors.pickupZone}
              placeholder="Select Zone"
              required
              {...register('pickupZone', { required: 'Pickup zone is required' })}
            />
            <Select
              label="Drop Zone"
              name="dropZone"
              options={zoneOptions}
              error={errors.dropZone}
              placeholder="Select Zone"
              required
              {...register('dropZone', { required: 'Drop zone is required' })}
            />
          </div>

          <Input
            label="Full Pickup Address"
            name="pickupAddress"
            icon={FiMapPin}
            placeholder="Warehouse address, building number, room, floor..."
            error={errors.pickupAddress}
            required
            {...register('pickupAddress', { required: 'Pickup address is required' })}
          />

          <Input
            label="Full Destination Address"
            name="dropAddress"
            icon={FiCompass}
            placeholder="Delivery address, building name, landmark..."
            error={errors.dropAddress}
            required
            {...register('dropAddress', { required: 'Drop address is required' })}
          />

          <hr className="border-slate-100 dark:border-slate-750 my-6" />

          <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-2">
            2. Package Dimensions & Weights
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Input
              label="Length (cm)"
              name="length"
              type="number"
              placeholder="10"
              error={errors.length}
              required
              {...register('length', { required: 'Required', min: 1 })}
            />
            <Input
              label="Breadth (cm)"
              name="breadth"
              type="number"
              placeholder="10"
              error={errors.breadth}
              required
              {...register('breadth', { required: 'Required', min: 1 })}
            />
            <Input
              label="Height (cm)"
              name="height"
              type="number"
              placeholder="10"
              error={errors.height}
              required
              {...register('height', { required: 'Required', min: 1 })}
            />
            <Input
              label="Actual Weight (kg)"
              name="actualWeight"
              type="number"
              step="0.01"
              placeholder="1.5"
              error={errors.actualWeight}
              required
              {...register('actualWeight', { required: 'Required', min: 0.1 })}
            />
          </div>

          <hr className="border-slate-100 dark:border-slate-750 my-6" />

          <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider mb-2">
            3. SLA & Payment Type
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Order Scope Type"
              name="orderType"
              options={[{ value: 'B2C', label: 'B2C Retail Delivery' }, { value: 'B2B', label: 'B2B Freight Bulk' }]}
              error={errors.orderType}
              required
              {...register('orderType')}
            />
            <Select
              label="Payment Method"
              name="paymentType"
              options={[{ value: 'Prepaid', label: 'Prepaid (Card / Wallet)' }, { value: 'COD', label: 'Cash on Delivery (COD)' }]}
              error={errors.paymentType}
              required
              {...register('paymentType')}
            />
          </div>
        </div>

        {/* Live Calculation Price Preview Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-premium flex flex-col justify-between h-fit">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Price Calculation Telemetry
              </h3>
              
              <div className="space-y-3 mt-6">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-450">Volumetric Weight:</span>
                  <span className="font-semibold text-white">{calculations.volumetricWeight} kg</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-450">Actual Weight:</span>
                  <span className="font-semibold text-white">{actualWeight || 0} kg</span>
                </div>
                <div className="flex justify-between text-xs border-t border-slate-800 pt-3">
                  <span className="text-slate-405 font-bold">Billable Weight:</span>
                  <span className="font-bold text-brand-400">{calculations.billableWeight} kg</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Estimated Cost</p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-3xl font-extrabold text-white">
                    {formatCurrency(calculations.estimatedPrice)}
                  </span>
                  <span className="text-xs text-slate-400">USD</span>
                </div>
                <p className="text-[10px] text-slate-450 mt-2 leading-relaxed">
                  *Based on selected Zone scope rates. Taxes calculated at checkout.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="success"
              className="w-full mt-8 shadow-md"
              loading={isSubmitting}
            >
              Book Delivery Order
            </Button>
          </div>

          {/* Guidelines */}
          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-205 dark:border-slate-750 text-xxs leading-relaxed text-slate-500 dark:text-slate-400">
            <p className="font-bold text-slate-750 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <FiTruck className="text-brand-500" />
              Weight Calculation Rules
            </p>
            Standard volumetric factor divisor is 5000. Under SLA guidelines, the billable weight matches whichever is higher between actual cargo mass or dimensional footprint.
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
