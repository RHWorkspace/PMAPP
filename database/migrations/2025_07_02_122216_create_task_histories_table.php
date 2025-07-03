<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('task_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->enum('title', ['Created', 'Updated']);
            $table->text('description')->nullable();
            $table->enum('status', ['Todo', 'In Progress', 'Done', 'Pending', 'Cancel'])->nullable();
            $table->integer('progress')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_histories');
    }
};
